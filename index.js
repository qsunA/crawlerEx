const xlsx = require('xlsx');
const axios = require('axios');
const cheerio = require('cheerio');
const workbook = xlsx.readFile('./csv/booklist.xlsx');

const ws = workbook.Sheets.book;
console.log(ws);

const records = xlsx.utils.sheet_to_json(ws);
for(const [i, r] of records.entries()){
    console.log(i, r);
}

records.forEach((r,i)=>{
    console.log(i, r.제목, r.가격, r.링크);
});

const crawler = async()=>{
    await Promise.all(records.map(async(r)=>{
        const response = await axios.get(r.링크);
        if(response.status ===200){
            const html = response.data;
            const $ = cheerio.load(html);
            const point= $('.info_list.Ere_fs15.Ere_ht18 .Ere_sub_pink.Ere_fs16.Ere_str').text();
            console.log(r.제목, '평점',point.trim());
        }
    }));
};

crawler();