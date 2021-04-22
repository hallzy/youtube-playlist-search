export default function tokenizeFilter(str) {
    let inQuotes = false;

    return str
        .trim()
        .match(/\\?.|^$/g)
        .reduce((acc, char) => {
            if(char === '"') {
                inQuotes = !inQuotes;
            } else if (!inQuotes && char === ' ') {
                acc.push('');
            } else {
                acc[acc.length-1] += char.replace(/\\(.)/,"$1");
            }
            return acc;
        }, ['']);
}
