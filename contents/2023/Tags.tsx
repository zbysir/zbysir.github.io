export default ({tags}: { tags: string|string[] }) => {
    let ts = []
    if (typeof tags=='string'){
        ts = tags.split(',')
    }else{
        ts = tags
    }
    return <div className={'flex flex-nowrap space-x-2 !-mt-6 opacity-50'}>
        {ts.map(t => <div>#{t}</div>)}
    </div>
}