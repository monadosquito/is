import { Holiday } from '@core/Day'
import { IDayRepository } from "@ports/DayRepository"
import { IDay } from '@ports/Day'

import exp from 'express'


class HolidayService implements IDay<exp.Request, exp.Response> {
    private dbConn: IDayRepository<Holiday>

    constructor(dbConn: IDayRepository<Holiday>) {
        this.dbConn = dbConn
    }

    public async add(req: exp.Request): Promise<boolean> {
        const holiday = req.body 
        const added = await this.dbConn.add(holiday)
        return added
    }

    public list(_: exp.Request, res: exp.Response): void {
        const holidays = this.dbConn.list() 
        res.json(holidays)
    }

    public async delete(req: exp.Request): Promise<boolean> {
        const id = +req.params.id
        const deleted = await this.dbConn.delete(id)
        return deleted
    }
}


export { HolidayService }
