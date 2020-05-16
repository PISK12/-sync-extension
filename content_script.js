browser.storage.local.get({'token': '', 'urlList': []}, (items) => {
    if (items.token !== '') {
        document.getElementById('container-empty-token').style.display = 'none';
        document.getElementById('container-token').style.display = 'block';

        displayUrlList(items.urlList);
    }
});

document.getElementById('button-get-token').addEventListener('click', (ev) => {
    fetch('https://sync-url.ey.r.appspot.com/token')
        .then(res => res.json())
        .then(data => {
            document.getElementById('input-token').value = data.token;
        }).catch(ev => {
        alert(ev);
    })
    ;
});


document.getElementById('button-save-token').addEventListener('click', (ev) => {
    const token = document.getElementById('input-token').value;
    browser.storage.local.set({'token': token}, () => {
        document.getElementById('container-empty-token').style.display = 'none';
        document.getElementById('container-token').style.display = 'block';
        getUrlList(token,0, 100)
            .then(urlList=>{
                saveUrlList(urlList).finally();
                return urlList;
            })
            .then(urlList=>{
                displayUrlList(urlList);
                return urlList;
            })
            .finally()
        ;
    });
});

document.getElementById('button-sync').addEventListener('click', (ev) => {
    browser.storage.local.get('token', (items) => {
        const token = items.token;
        const offset = 0;
        const limit = 100;
        getUrlList(token,0, 100)
            .then(urlList=>{
                saveUrlList(urlList).finally();
                return urlList;
            })
            .then(urlList=>{
                displayUrlList(urlList);
                return urlList;
            })
            .finally()
        ;
    });
});

document.getElementById('button-save').addEventListener('click', ev => {
    browser.storage.local.get('token', (items) => {
        const token = items.token;
        browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
            save(token, tabs[0].url).then(
                (res)=>{
                    getUrlList(token)
                        .then(urlList=>{
                            saveUrlList(urlList).finally();
                            return urlList;
                        })
                        .then(urlList=>{
                            displayUrlList(urlList);
                            return urlList;
                        })
                        .finally()
                }
            );
        });
    });
});

const save = async (token, url) => {
    return await fetch(`https://sync-url.ey.r.appspot.com/url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'token': token, 'url': url})
    })
        .then(res => res.json())
        .catch(ev => {
            alert(ev);
        })
    ;
};

const getUrlList = async (token, offset = 0, limit = 100) => {
    return await fetch(`https://sync-url.ey.r.appspot.com/url?token=${token}&offset=${offset}&limit=${limit}`)
        .then(res => res.json());
};

const saveUrlList = async (urlList=[])=>{
    return await browser.storage.local.set({'urlList': urlList});
};

const displayUrlList = (urlList) => {
    console.log(urlList);
    let htmlList = '';
    urlList.forEach(element => {
        htmlList += `<li><a href="${element.url}">${element.url}</a></li>`;
    });

    const list = document.getElementById('url-list');
    list.textContent = '';
    list.insertAdjacentHTML('beforeend', htmlList);
}