const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const db = require('./models');

fs.readdir('bookimg',(err)=>{
    if(err)
    fs.mkdirSync('bookimg');
})

const crawlerBookInfo = async () =>{
    await db.sequelize.sync();
    try{
        const browser = await puppeteer.launch({headless : false, args : ['--window-size=1920,1080','--disable-notifications']});
        const page = await browser.newPage();
        const pageYes = await browser.newPage();
        const pageKb = await browser.newPage();
        await page.setViewport({
            width : 1080,
            height : 1080,
        });

        await page.goto('https://www.aladin.co.kr/shop/wbrowse.aspx?BrowseTarget=BestSeller&CID=2719', {
            waitUntil : 'networkidle0' // 로딩 완료될때까지 기다리기 
        });// 알라딘 컴퓨터 공학 책 사이트  
        
        let result = new Map();
        result.set('bookInfo',[]);
        result.set('aladin',[]);
        result.set('kb',[]);
        result.set('yes',[]);
        await page.waitForSelector('.bo');
        const bookHrefs = await page.evaluate(()=>{   
            const list = Array.from(document.querySelectorAll('.bo')).map(v=> {return {title : v.textContent, href : v.href}});

            return list; // array 리턴
        });

        for(let val of bookHrefs){

            console.log(`** val ${val.href}`);
            await page.goto(val.href, {
                waitUntil : 'networkidle0' // 로딩 완료될때까지 기다리기 
            });
            const title = val.title;
            console.log(`title ${title}`);
            let isbn = '';

            const bookInfo = await page.evaluate(()=>{
                // 알라딘에서 컴퓨터 공학 bestseller 도서들 정보 가지고오기 
                const subTitle = document.querySelector('.Ere_sub1_title') && document.querySelector('.Ere_sub1_title').textContent;
                const author = document.querySelector('.Ere_sub2_title a:first-child') && document.querySelector('.Ere_sub2_title a:first-child').textContent;
                const img = document.querySelector('#CoverMainImage') && document.querySelector('#CoverMainImage').src;
                const point = document.querySelector('.Ere_sub_pink.Ere_fs16.Ere_str') && document.querySelector('.Ere_sub_pink.Ere_fs16.Ere_str').textContent;
                const price = document.querySelector('.info_list:first-child ul li:first-child .Ritem') && document.querySelector('.info_list:first-child ul li:first-child .Ritem').textContent.replace('원','').replace(',','').replace(/ /gi,"");
                const discontPrice = document.querySelector('.Ritem.Ere_ht11 span') && document.querySelector('.Ritem.Ere_ht11 span').textContent;
                isbn = document.querySelector('.conts_info_list1 li:last-child')
                    && document.querySelector('.conts_info_list1 li:last-child').textContent.includes("ISBN") && document.querySelector('.conts_info_list1 li:last-child').textContent.replace('ISBN','').replace(':','').replace(/ /gi,'');
                return {
                    subTitle,
                    author,
                    img,
                    point,
                    price,
                    discontPrice,
                    isbn
                }
            });

            bookInfo['title'] = title;

            if(bookInfo.img){
                // 이미지 불러오기
                const imgResult = await axios.get(bookInfo.img,{
                    responseType : 'arraybuffer',
                });
                fs.writeFileSync(`bookimg/${bookInfo.title.replace(/\//gi,"_").replace(/ /gi,"_")}.jpg`);
                bookInfo.img = bookInfo.title.replace(/\//gi,"_").replace(/ /gi,"_");
            }
            // 도서 정보와 이미지 db에 저장 
            // 교보문고에서 해당 도서 검색, 가격&포인트 확인 + yes24도 동일 
            console.log(`bookInfo ${bookInfo}`);
            result.get('bookInfo').push(bookInfo);
            result.get('aladin').push({point:bookInfo.point, discountPrice : bookInfo.discountPrice});

            await pageYes.goto(`http://www.yes24.com/searchcorner/Search?query=${bookInfo.isbn}`);
            await pageYes.waitForSelector('.goods_img:first-child>a');

            constYesBook = await pageYes.evaluate(()=>{
                document.querySelector('.goods_img:first-child>a').click();
            });
            await pageYes.waitForSelector('.gd_name');
            const yesBookInfo = await pageYes.evaluate(()=>{
                const point = document.querySelector('#spanGdRating .yes_b') && Number(document.querySelector('#spanGdRating .yes_b').textContent);
                const discountPrice = document.querySelector('.nor_price .yes_m') && Number(document.querySelector('.nor_price .yes_m').textContent.replace(',',''));
                return {
                    point,
                    discountPrice,
                    isbn: isbn
                }
            });
            console.log(`yes ${yesBookInfo}`);
            result.get('yes').push(yesBookInfo);

            await pageKb.goto(`http://www.kyobobook.co.kr/product/detailViewKor.laf?barcode=${bookInfo.isbn}`);
            await pageKb.waitForSelector('.box_detail_point');

            const kbBookInfo = await pageKb.evaluate(()=>{
                const point = document.querySelector('.review_klover em') && Number(document.querySelector('.review_klover em').textContent);
                const discountPrice = document.querySelector('.sell_price strong') && Number(document.querySelector('.sell_price strong').textContent);
                return {
                    point, 
                    discountPrice,
                    isbn: isbn
                }
            });
            result.get('kb').push(kbBookInfo);
            console.log(`kb ${kbBookInfo}`);
        }

        await Promise.all([
            result.get('bookInfo').map(v=>{
                return db.BookInfo.create({
                    isbn : v.isbn,
                    author : v.author,
                    title : v.title,
                    subTitle : v.subTitle,
                    price : v.price,
                    img : v.img
                });
            }),          

            result.get('yes').map(v=>{
                return db.BookYes.create({
                    point : v.point,
                    discountPrice : v.discountPrice,
                    isbn : isbn
                });
            }),

            result.get('kb').map(v=>{
                return db.BookKb.create({
                    point : v.point,
                    discountPrice : v.discountPrice,
                    isbn : isbn
                });
            }),
            result.get('bookInfo').map(v=>{
                return db.BookAladin.create({
                    point : v.point,
                    discountPrice : v.discountPrice,
                    isbn : isbn
                });
            }),

        ]);
        
        await pageYes.close();
        await pageKb.close();
        await page.close();
        await browser.close();

    }catch(e){
        console.error(e);
    }
}


crawlerBookInfo();