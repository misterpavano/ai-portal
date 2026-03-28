export function generatePassword() {
    var randomstring = Math.random().toString(36).slice(-5) + 'A!1';
    return randomstring;
}