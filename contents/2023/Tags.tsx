export default ({tags}: { tags: string|string[] }) => {
    let ts = []
    // split string to array
    if (typeof tags == 'string') {
        ts = tags.split(',')
    } else {
        ts = tags
    }

    return <div className={'flex flex-nowrap space-x-2 !-mt-6'}>
        {ts.map(t => <div className="opacity-50">#{t}</div>)}
    </div>
}