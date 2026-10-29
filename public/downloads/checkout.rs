//! async-checkout: a tiny async state machine, meant to be reverse-engineered.
//!
//! Build:  rustc --edition 2021 -C opt-level=2 -C panic=abort -o checkout.bin checkout.rs
//! Run:    ./checkout.bin <key>           e.g. ./checkout.bin 1234
//! Goal:   find the <key> that prints "ACCESS GRANTED".
//!
//! One `async fn checkout` with three `.await` points lowers to a state
//! machine: `poll` dispatches on a discriminant instead of running the blocks
//! in source order. A hand-rolled single-threaded executor drives it, so there
//! is no runtime dependency (it builds offline) and the state machine survives
//! into the binary as its own function reached through a vtable.

use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll, RawWaker, RawWakerVTable, Waker};

// ---- "business logic", kept out of line so it shows up by name in Ghidra ----

#[no_mangle]
#[inline(never)]
fn authenticate(key: u64) -> u64 {
    // derive a user id from the key
    std::hint::black_box(key).wrapping_mul(2654435761) & 0xffff
}

#[no_mangle]
#[inline(never)]
fn charge(user: u64) -> bool {
    // the "payment" clears only for the expected user id
    std::hint::black_box(user) == 32045
}

#[no_mangle]
#[inline(never)]
fn ship(user: u64) -> u64 {
    std::hint::black_box(user).rotate_left(13) ^ 0x5bd1e995
}

// ---- a future that returns Pending exactly once, then Ready ----
// It stands in for real I/O, so each `.await` is a genuine suspend point and
// the compiler cannot collapse the state machine back into straight-line code.

struct YieldOnce(bool);

impl Future for YieldOnce {
    type Output = ();
    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<()> {
        if self.0 {
            Poll::Ready(())
        } else {
            self.0 = true;
            cx.waker().wake_by_ref();
            Poll::Pending
        }
    }
}

fn yield_now() -> YieldOnce {
    YieldOnce(false)
}

// ---- the async fn under study: three awaits, one branch ----

async fn checkout(key: u64) -> u64 {
    let user = authenticate(key);
    yield_now().await; // await #1
    let paid = charge(user);
    yield_now().await; // await #2
    if paid {
        let receipt = ship(user);
        yield_now().await; // await #3
        receipt
    } else {
        0
    }
}

// ---- a minimal executor: no runtime dependency ----

fn raw_waker() -> RawWaker {
    fn no_op(_: *const ()) {}
    fn clone(_: *const ()) -> RawWaker {
        raw_waker()
    }
    static VT: RawWakerVTable = RawWakerVTable::new(clone, no_op, no_op, no_op);
    RawWaker::new(std::ptr::null(), &VT)
}

// Boxed as a trait object and laundered through black_box so the optimizer
// cannot devirtualize the call: poll goes through a vtable, and the generated
// state machine stays a function of its own instead of being inlined here.
#[inline(never)]
fn block_on<T>(fut: Pin<Box<dyn Future<Output = T>>>) -> T {
    let mut fut = std::hint::black_box(fut);
    let waker = unsafe { Waker::from_raw(raw_waker()) };
    let mut cx = Context::from_waker(&waker);
    loop {
        match fut.as_mut().poll(&mut cx) {
            Poll::Ready(v) => return v,
            Poll::Pending => continue, // our waker woke us immediately
        }
    }
}

fn main() {
    let key: u64 = std::env::args()
        .nth(1)
        .and_then(|s| s.parse().ok())
        .unwrap_or(0);
    let receipt = block_on(Box::pin(checkout(key)));
    if receipt != 0 {
        println!("ACCESS GRANTED  receipt={receipt:#x}");
    } else {
        println!("access denied");
    }
}
