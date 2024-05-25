import { Weekend } from '@core/Day'
import { IDayRepository } from "@ports/DayRepository"
import { IDay } from '@ports/Day'

import exp from 'express'


class WorkingWeekend implements IDay<exp.Request, exp.Response> {
    private dbConn: IDayRepository<Weekend>

    constructor(dbConn: IDayRepository<Weekend>) {
        this.dbConn = dbConn
    }

    public async add(req: exp.Request): Promise<boolean> {
        const workingWeekend = req.body 
        const added = await this.dbConn.add(workingWeekend)
        return added
    }

    public async list(_: exp.Request, res: exp.Response): Promise<void> {
        const workingWeekends = await this.dbConn.list() 
        res.json(workingWeekends)
    }

    public async delete(req: exp.Request): Promise<boolean> {
        const id = +req.params.id
        const deleted = await this.dbConn.delete(id)
        return deleted
    }
}


export { WorkingWeekend }
