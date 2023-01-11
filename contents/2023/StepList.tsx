interface Item {
    time: string
    content: string
}

interface Props {
    items: Item[]
}

export default ({items}: Props) => {
    return <div className={'flex flex-nowrap items-center space-x-2 overflow-x-auto'}>
        {items.map(i => ({
            year: i.time.split('-')[0],
            monthday: i.time.split('-').slice(1).join('-'),
            content: i.content
        })).map((i,index) =>
            <>
                <div className={"shrink-0 flex px-3 py-2 border border-neutral-300 dark:border-neutral-900 bg-white dark:bg-neutral-900 rounded-md content-center items-center"}>
                    <div className={"text-center text-neutral-500"}>
                        <div className={""}>{i.year}</div>
                        <div className={"text-xs"}>{i.monthday}</div>
                    </div>
                    <div className={"pl-3"}>{i.content}</div>
                </div>
                {
                    index!=items.length-1?<div>-</div>:null
                }
            </>
        )
        }
        <div></div>
    </div>
}