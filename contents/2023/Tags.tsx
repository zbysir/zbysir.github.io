export default ({tags}: { tags: string }) => {
    const ts = tags.split(',')
    return <div className={'flex flex-nowrap space-x-2 -mt-6 opacity-50'}>
        {ts.map(t => <div>#{t}</div>)}
    </div>
}