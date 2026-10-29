// Disassemble the six state targets of checkout::checkout::{closure#0}
// and give the decompiler its switch (jump at 00114c7c, table at 00104ec0).
// Works on checkout.bin and checkout-stripped.bin. Save it in ~/ghidra_scripts/
// and run it from Window > Script Manager.
//@category Repair
import ghidra.app.script.GhidraScript;
import ghidra.app.cmd.function.CreateFunctionCmd;
import ghidra.program.model.address.Address;
import ghidra.program.model.listing.*;
import ghidra.program.model.pcode.JumpTable;
import ghidra.program.model.symbol.*;
import java.util.ArrayList;

public class FixCheckoutSwitch extends GhidraScript {
    @Override
    public void run() throws Exception {
        Address jmp = toAddr(0x114c7c);
        // 0x104ec0 + each int of the table, in state order 0..5
        long[] targets = {0x114c7e, 0x114d1d, 0x114d2a, 0x114cc8, 0x114c98, 0x114c8c};
        ArrayList<Address> dests = new ArrayList<>();
        for (long t : targets) {
            Address a = toAddr(t);
            if (getInstructionAt(a) == null) disassemble(a);
            dests.add(a);
        }
        Instruction jump = getInstructionAt(jmp);
        for (Address a : dests)
            jump.addOperandReference(0, a, RefType.COMPUTED_JUMP, SourceType.USER_DEFINED);
        Function f = getFunctionContaining(jmp);
        new JumpTable(jmp, dests, true).writeOverride(f);
        CreateFunctionCmd.fixupFunctionBody(currentProgram, f, monitor);
    }
}
