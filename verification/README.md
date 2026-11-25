# Verification

Levels: planned, executed, roundtrip-verified, independently-reproduced, contest-eligible; failed/blocked explicit. A build is not a compression result.

Frontier gate: official full target identity and digest, archived candidate digest and size, immutable revision, commands, isolated decoder without corpus or network, independent exact byte equality and hash, complete accounting of side data. Record time and memory or explicitly mark missing. Contest-comparable results additionally require actual compressor plus self-extracting archive size and compliance with current rules. Reject malformed/ambiguous frames, overflow, trailing data and hidden dictionaries. Test empty, leading-zero, random, boundary and truncated input.
