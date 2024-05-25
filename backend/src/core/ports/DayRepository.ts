import { Day } from "@core/Day"


interface IDayRepository<D extends Day> {
    add: (day: D) => Promise<boolean>
    list: () => Promise<D[]>
    delete: (id: number) => Promise<boolean>
}


export type { IDayRepository }
