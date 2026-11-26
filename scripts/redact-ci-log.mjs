import {readFileSync} from 'node:fs';
let log=readFileSync(process.argv[2],'utf8');
// Remove ANSI sequences, credentials and sensitive inherited environment values.
log=log.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'');
log=log.replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g,'[REDACTED PRIVATE KEY]');
log=log.replace(/\b(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|ghs_[A-Za-z0-9_]+)\b/g,'[REDACTED TOKEN]');
log=log.replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,'[REDACTED JWT]');
log=log.replace(/(https?:\/\/)[^/\s@]+:[^/\s@]+@/gi,'$1[REDACTED]@');
log=log.replace(/(authorization\s*[:=]\s*(?:bearer|basic|token)\s+)\S+/gi,'$1[REDACTED]');
log=log.replace(/^(.*(?:TOKEN|PASSWORD|SECRET|PRIVATE_KEY|API_KEY|CREDENTIAL)[A-Z0-9_]*\s*[:=]).*$/gim,'$1[REDACTED]');
for(const [name,value] of Object.entries(process.env)){
 if(/TOKEN|PASSWORD|SECRET|PRIVATE_KEY|API_KEY|CREDENTIAL/i.test(name)&&value&&value.length>=4)log=log.split(value).join('[REDACTED ENV]');
}
// GitHub Check output has a 65535-character limit. Preserve both ends.
const chars=Array.from(log);
if(chars.length>60000)log=chars.slice(0,12000).join('')+'\n[Middle omitted: GitHub Check output limit; full log retained locally]\n'+chars.slice(-47000).join('');
process.stdout.write(log);
