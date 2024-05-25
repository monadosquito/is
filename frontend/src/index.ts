import { promises as fs } from 'fs'
import path from 'path'
import yaml from 'yaml'


const addHoliday = async (h: any) => {
    await fetch('http://localhost:8000/holiday/add', {
        method: 'POST',
        body: JSON.stringify(h),
        headers: {
            'Content-Type': 'application/json'
        },
    })
}


const root = process.env.PWD

fs.readFile(path.join(root + '/data/holidays-2023.json'), 'utf8')
    .then(JSON.parse)
    .then(res2023 => {
        fs.readFile(path.join(root + '/data/holidays-2024.json'), 'utf8')
            .then(JSON.parse)
            .then(res2024 => {
                (async () => {
                    for (const h of res2023.holidays) {
                        await addHoliday(h)
                    }
                    const workingHoursApr2023 = await fetch('http://localhost:8000/working-hour/get/?month=april').then(res => res.json())
                    const workingHoursMay2023 = await fetch('http://localhost:8000/working-hour/get/?month=may').then(res => res.json())
                    const workingHoursAprMay2023 = await fetch('http://localhost:8000/working-hour/get/?from=apr?to=may').then(res => res.json())
                    await fetch('http://localhost:8000/clean')
                    for (const h of res2024.holidays) {
                        await addHoliday(h)
                    }
                    const workingHoursApr2024 = await fetch('http://localhost:8000/working-hour/get/?month=4').then(res => res.json())
                    const workingHoursMay2024 = await fetch('http://localhost:8000/working-hour/get/?month=5').then(res => res.json())
                    const workingHoursAprMay2024 = await fetch('http://localhost:8000/working-hour/get/?from=4?to=5').then(res => res.json())

                    await addHoliday({ name: 'Холидэй', date: '2024-05-06' })
                    await addHoliday({ name: 'Холидэй', date: '2024-05-07' })
                    await addHoliday({ name: 'Холидэй', date: '2024-05-08' })

                    const workingHoursApr2024_2 = await fetch('http://localhost:8000/working-hour/get/?month=4').then(res => res.json())
                    const workingHoursMay2024_2 = await fetch('http://localhost:8000/working-hour/get/?month=5').then(res => res.json())
                    const workingHoursAprMay2024_2 = await fetch('http://localhost:8000/working-hour/get/?from=4?to=5').then(res => res.json())

                    const contents = yaml.stringify({
                        workingHoursApr2023,
                        workingHoursMay2023,
                        workingHoursAprMay2023,
                        workingHoursApr2024,
                        workingHoursMay2024,
                        workingHoursAprMay2024,
                        workingHoursApr2024_2,
                        workingHoursMay2024_2,
                        workingHoursAprMay2024_2,
                    })
                    fs.writeFile(root + '/data/result.yaml', contents)
                })()
            }) 
    })
