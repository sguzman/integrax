[scan("INTEGRAX_RESULT (\\{[^{}\\r\\n]*\\})")[] | fromjson]
| if length != $expected or $expected != 1 then error("unexpected full record count") else . end
| if all(.[]; type=="object" and
    (keys == ["archive_bytes","archive_sha256","byte_equal","codec_bytes","decode_rss_kib","decode_seconds","decoded_sha256","dictionary_bytes","dictionary_sha256","encode_rss_kib","encode_seconds","input_bytes","input_sha256","isolated","mode","sandbox_uid","training_sha256"]) and
    .mode==$mode and .input_bytes==1000000000 and .byte_equal==true and .isolated==true and
    .input_sha256=="159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc" and .decoded_sha256==.input_sha256 and
    .dictionary_sha256=="3651e9523e3ddc5db5e2d112832aca59794b9bc12dc433467cd14dc205c3cf9d" and .dictionary_bytes==65538 and
    .training_sha256=="65dd770568be321494dcc88019e75ee92fc67fbcf75adc1abd8a35a9504a1895" and
    (.archive_sha256|type=="string" and test("^[a-f0-9]{64}$")) and
    ([.archive_bytes,.codec_bytes,.sandbox_uid,.encode_rss_kib,.decode_rss_kib]|all(.[];type=="number" and .>0 and .<=2000000000 and floor==.)) and
    ([.encode_seconds,.decode_seconds]|all(.[];type=="number" and .>=0 and .<=86400)))
  then . else error("invalid full result schema") end
