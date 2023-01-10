export const hollow = {
    theme: 'https://github.com/zbysir/hollow-theme/tree/master/hollow',
    // theme: 'file://Users/bysir/front/bysir/hollow-theme/hollow',
    assets: ['statics']
}

export const theme = {
    title: 'Bysir 的博客',
    logo: "bysir",
    fonts: [
        {
            selector: "body",
            family: "Noto Serif SC"
        },
        {
            selector: ".hollow-content",
            // 设置为默认字体，参考：https://zhuanlan.zhihu.com/p/313284552
            family: 'Arial,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","WenQuanYi Micro Hei",sans-serif'
        }
    ],
    stack: '<a href="https://github.com/zbysir/hollow">Hollow</a> + <a href="https://github.com/zbysir/gojsx">Jsx / Mdx</a>',
    footer_links: [
        {
            link: 'https://github.com/zbysir',
            name: 'GitHub',
            icon: 'GitHub'
        }
    ],
    links_page: 'pages/links.md',
    about_page: 'pages/about.md',
    gallery: {
        title: "照片与故事",
        items: [
            {text: "好朋友婚礼", url: "https://blog-static.bysir.top/1667181934593-01.jpeg"},
            {text: "再一次去重庆，还是很好玩", url: "https://blog-static.bysir.top/DSC08656-01.jpeg"},
            {text: "金顶，站在悟空才能到达的地方", url: "https://blog-static.bysir.top/DSC06061-01.jpeg"},
            {text: "川大的银杏", url: "https://blog-static.bysir.top/DSC05625-01.jpeg"},
            {text: "哈根达斯有点甜", url: "https://blog-static.bysir.top/IMG_20190215_155754-01.jpeg"},
            {text: "打卡网红城市 - 重庆", url: "https://blog-static.bysir.top/DSC06462-01.jpeg"},
            {text: "打卡网红游乐园 - 重庆奥陶纪", url: "https://blog-static.bysir.top/DSC06410-01.jpeg"},
            {
                text: "魔都的迪士尼，由于不是假期去的，人少不用排队，每个项目可以玩好几遍",
                url: "https://blog-static.bysir.top/DSC05367-01.jpeg"
            },
            {
                text: "音乐节至少还是参加一次，感受感受（去听水星记）",
                url: "https://blog-static.bysir.top/DSC04833-01.jpeg"
            },
            {
                text: "音乐节至少还是参加一次，感受感受（去听水星记）",
                url: "https://blog-static.bysir.top/DSC04915-01.jpeg"
            },
            {text: "拼一个圣诞装扮（其实卖家秀好看多了）", url: "https://blog-static.bysir.top/DSC00553.JPG"},
            {text: "云南天气真好，还想再去一次", url: "https://blog-static.bysir.top/DSC03185-01.jpeg"},
            {text: "云南天气真好，还想再去一次", url: "https://blog-static.bysir.top/DSC03039-01.jpeg"},
            {text: "拼了一下午，这种东西只会买一次", url: "https://blog-static.bysir.top/DSC06864.JPG"},
            {text: "天气好，打工都轻松一点", url: "https://blog-static.bysir.top/IMG_20190611_191053-01.jpeg"},
            {text: "扫街 - 成都", url: "https://blog-static.bysir.top/DSC02369-01.jpeg"},
            {text: "喜欢这个颜色", url: "https://blog-static.bysir.top/mmexport1555770029553.jpg"},
            {text: "扫街 - 春熙路，那时候大家还不用戴口罩", url: "https://blog-static.bysir.top/DSC02288-01.jpeg"},
            {text: "安静的周末，安静的🌧", url: "https://blog-static.bysir.top/IMG_20180714_223519-01.jpeg"},
            {text: "沉浸在海拉鲁无法自拔", url: "https://blog-static.bysir.top/DSC04245-02.jpeg"},
        ].map(i => ({...i, url: i.url + '?imageView2/2/w/1200', thumb: i.url + '?imageView2/2/w/200'}))
    },
    assets: ['/index.css', '/app.js']
}