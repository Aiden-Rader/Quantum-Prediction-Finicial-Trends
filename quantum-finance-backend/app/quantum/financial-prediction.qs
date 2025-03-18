namespace QuantumModel {
    open Microsoft.Quantum.Canon;
    open Microsoft.Quantum.Intrinsic;

	operation QuantumPreiction(input: Double[]) : Double {
		use q = Qubit();
		H(q);
	}

	operation main() : Unit {
		HelloQ();
	}
}

