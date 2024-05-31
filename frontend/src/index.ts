import { promises as fs } from 'fs'
import path from 'path'
import yaml from 'yaml'


const HOST = 'localhost'
const PORT = 8000


type Month = number | string


const getMonth = async (m: Month) =>
    await fetch(`http://${HOST}:${PORT}/working-hour/get/?month=${m}`)
        .then(res => res.json())

const getMonths = async (from: Month, to: Month) =>
    await fetch(`http://${HOST}:${PORT}/working-hour/get/?from=${from}&to=${to}`)
        .then(res => res.json())

const clean = async () => await fetch(`http://${HOST}:${PORT}/clean`)


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
                    await clean()
                    for await (const h of res2023.holidays) {
                        await addHoliday(h)
                    }
                    const workingHoursApr2023 = await getMonth('april')
                    const workingHoursMay2023 = await getMonth('may')
                    const workingHoursAprMay2023 = await getMonths('apr', 'may')
                    await clean()
                    for await (const h of res2024.holidays) {
                        await addHoliday(h)
                    }
                    const workingHoursApr2024_1 = await getMonth(4)
                    const workingHoursMay2024_1 = await getMonth(5)
                    const workingHoursAprMay2024_1 = await getMonths(4, 5)

                    await addHoliday({ name: 'Холидэй', date: '2024-05-06' })
                    await addHoliday({ name: 'Холидэй', date: '2024-05-07' })
                    await addHoliday({ name: 'Холидэй', date: '2024-05-08' })

                    const workingHoursApr2024_2 = await getMonth(4)
                    const workingHoursMay2024_2 = await getMonth(5)
                    const workingHoursAprMay2024_2 = await getMonths(4, 5)

                    const contents = yaml.stringify({
                        workingHoursApr2023,
                        workingHoursMay2023,
                        workingHoursAprMay2023,
                        workingHoursApr2024_1,
                        workingHoursMay2024_1,
                        workingHoursAprMay2024_1,
                        workingHoursApr2024_2,
                        workingHoursMay2024_2,
                        workingHoursAprMay2024_2,
                    })
                    fs.writeFile(root + '/data/result.yaml', contents)
                })()
            }) 
    })
