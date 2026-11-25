use std::{env,fs,process::ExitCode};
fn run()->Result<(),String>{
    let a:Vec<_>=env::args_os().collect();
    if a.len()!=4 { return Err("usage: integrax encode|decode INPUT OUTPUT".into()); }
    let input=fs::read(&a[2]).map_err(|e|e.to_string())?;
    let output=match a[1].to_str(){
        Some("encode")=>integrax::encode(&input),
        Some("decode")=>integrax::decode(&input).map_err(str::to_string)?,
        _=>return Err("unknown mode".into()),
    };
    fs::write(&a[3],output).map_err(|e|e.to_string())
}
fn main()->ExitCode{
    match run(){ Ok(())=>ExitCode::SUCCESS, Err(e)=>{eprintln!("{e}");ExitCode::FAILURE} }
}
