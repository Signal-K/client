export default function capitalize(input: string): string {
    if (input.length === 0) {
      return '';
    }
  
    let result = input[0].toUpperCase();
    for (let i = 1; i < input.length; i++) {
      result += input[i].toLowerCase();
    }
  
    return result;
}  