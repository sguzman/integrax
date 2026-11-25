# Ontology

Corpus: immutable bytes, length and SHA-256. IntegerView: unsigned integer plus original length. Representation: versioned expression AST or DAG. Candidate: representation and residual. Transform: reversible mapping and charged parameters. Codec: serialization and reconstruction algorithm. Artifact: bytes, digest and size. Experiment: bounded run with revision, inputs and commands. Observation: measured value with scope. Verification: independent reconstruction evidence. Claim: proof, conjecture or evidence-backed statement. Campaign: bounded research question. FrontierEntry: verified improvement within comparable scope.

Relations: Corpus has IntegerView; Candidate represents IntegerView; Codec serializes Candidate as Artifact; Experiment evaluates Candidate; Verification checks Artifact reconstructs Corpus; Claim cites Observation or proof; Campaign owns Experiments and Claims; FrontierEntry references Artifact and Verification.

IDs: Cnn campaigns, Ennnn experiments, Vnnnn verifications, Qnnnn claims, Fnnnn frontier records. Use content hashes for immutable artifacts.
