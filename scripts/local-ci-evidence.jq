[scan("INTEGRAX_RESULT (\\{[^{}\\r\\n]*\\})")[] | fromjson]
| if length != $expected then error("unexpected record count") else . end
| if all(.[]; type=="object" and
    (keys == ["append_rejected","archive_bytes","archive_equal","archive_sha256","byte_equal","decoded_sha256","input_bytes","input_sha256","kind","mode"]) and
    (.kind | type=="string" and test("^[a-z0-9_-]{1,40}$")) and
    (.mode == $mode) and
    ([.input_bytes,.archive_bytes] | all(.[]; type=="number" and .>=0 and .<=2000000000 and floor==.)) and
    ([.input_sha256,.archive_sha256,.decoded_sha256] | all(.[]; type=="string" and test("^[a-f0-9]{64}$"))) and
    .byte_equal==true and .archive_equal==true and .append_rejected==true and .input_sha256==.decoded_sha256)
  then . else error("invalid result schema") end
| if (map([.kind,.input_bytes,.mode])|unique|length) != $expected then error("duplicate result") else . end
