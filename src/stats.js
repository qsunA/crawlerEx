// exports.max = numbers => {
//     let result = numbers[0];
//     numbers.forEach(n=>{
//         if(n>result){
//             result= n;
//         }
//     });
//     return result;
// }

exports.max = num => Math.max(...num);
exports.min = num => Math.min(...num);
exports.avg = num => num.reduce((acc,cur,idx,{length})=>
    acc+cur /length,0);
exports.sort = num => num.sort((a,b)=>a-b)

exports.median = num => {
    const {length} = num;
    const middle = Math.floor(length/2);
    return length%2 ? num[middle] : (num[middle-1]+ num[middle])/2;
}

exports.mode = numbers => {
    const counts = numbers.reduce(
      (acc, current) => acc.set(current, acc.get(current) + 1 || 1),
      new Map()
    );
  
    const maxCount = Math.max(...counts.values());
    const modes = [...counts.keys()].filter(
      number => counts.get(number) === maxCount
    );
  
    if (modes.length === numbers.length) {
      return null;
    }
  
    if (modes.length > 1) {
      return modes;
    }
  
    return modes[0];
  };