import Header from "../particle/Header";
import Footer, {Link} from "../particle/Footer";

interface Props {
    title: string
    page_data?: any
    logo: string
    stack: string,
    time?: string
    footer_links?: Link[]
    children?: any
}

import hollow from "@bysir/hollow"

let params = hollow.getConfig();

export default function Index(props: Props) {
    let routerBase = params.base || ''

    return <html lang="zh" class="">
    <head>
        <meta charSet="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title || 'UnTitled'}</title>
        <link href={routerBase + '/tailwind.css'} rel="stylesheet"/>
        <link href={routerBase + '/prism/prism.css'} rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;900&amp;display=swap" rel="stylesheet"/>
    </head>
    <body className="
    bg-gray-50 dark:bg-black
    text-black
    dark:text-white
     min-h-screen language-plain font-noto flex flex-col">
    <Header name={props.logo}></Header>
    <div className="flex-1">
        {
            props.children
        }

    </div>

    <Footer name={props.logo} stack={props.stack} footer_links={props.footer_links}></Footer>
    <div>
        {props.time}
    </div>

    <script src={routerBase + '/prism/prism.js'}></script>
    </body>
    </html>
}
