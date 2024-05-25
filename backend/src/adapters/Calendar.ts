import {
    Weekend,
    Holiday,
    MonthNumber,
    MonthWorkingHours,
    shiftWeekend,
    monthWorkingHours,
    parseMonthInterval,
    isWeekend, 
} from "../core/Day";
import { ICalendar } from "@ports/Calendar";
import { ICalendarRepository } from "@ports/CalendarRepository";
import { IDay } from "@ports/Day";
import { IDayRepository } from "@ports/DayRepository";
import { HolidayService } from '@adapters/Holiday'
import { WorkingWeekend } from '@adapters/WorkingWeekend'

import exp from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'


class Calendar implements ICalendar<exp.Request, exp.Response> {
    private db: ICalendarRepository
    private holidayDb: IDayRepository<Holiday>
    private workingWeekendDb: IDayRepository<Weekend>
    private holiday: IDay<exp.Request, exp.Response>
    private workingWeekend: IDay<exp.Request, exp.Response>
    private app: exp.Application


    constructor(
        db: ICalendarRepository,
        holidayDb: IDayRepository<Holiday>,
        workingWeekendDb: IDayRepository<Weekend>,
    ) {
        this.db = db
        this.holidayDb = holidayDb
        this.workingWeekendDb = workingWeekendDb
        this.holiday = new HolidayService(this.holidayDb)
        this.workingWeekend = new WorkingWeekend(this.workingWeekendDb)
        this.app = exp()
    }

    async checkDay(req: exp.Request, res: exp.Response) {
        const date = new Date(req.params.date)
        const isHoliday = await this.db.isHoliday(date)
        if (isHoliday) {
            res.json({ dayType: 'dayOff' })
            return
        }
        if (!isWeekend(date)) {
            res.json({ dayType: 'workingDay' })
            return
        }
        const isWeekendWorking = await this.db.isWeekendWorking(date)
        res.json({ dayType: isWeekendWorking ? 'workingDay' : 'dayOff' })
    }

    async getWorkingHours(
        req: exp.Request,
        res: exp.Response,
    ): Promise<void> {
        const monthInt =
            parseMonthInterval
                (req.query.month as string)
                (req.query.from as string)
                (req.query.to as string)
        const workingHours = await this.db.getWorkingHours(monthInt)
        res.json(workingHours)
    }

    async updateWorkingHours(_: exp.Request, res: exp.Response) {
        const holidays = await this.holidayDb.list()
        const workingWeekends = await this.workingWeekendDb.list()
        const monthedWorkingHours = Object.entries(
            monthWorkingHours(holidays)(workingWeekends)
        )
        await this.db.cleanMonthWorkingHours()
        for (const [ month, workingHours ] of monthedWorkingHours) {
            const monthWorkingHours: MonthWorkingHours = {
                month: +month as MonthNumber,
                workingHours
            }
            await this.db.addMonthWorkingHours(monthWorkingHours)
        }
        res.sendStatus(200)
    }

    async clean(_: exp.Request, res: exp.Response) {
        await this.db.clean()
        res.sendStatus(200)
    }

    run() {
        this.app.use(bodyParser.json())
        this.app.use(helmet())

        this.app.post(
            '/holiday/add',
            async (
                req: exp.Request,
                res: exp.Response,
                next: exp.NextFunction,
            ) => {
                const added = await this.holiday.add.call(
                    this.holiday, req, res
                )
                if (added) {
                    const holiday = req.body as Holiday
                    const workingWeekend = shiftWeekend(holiday)
                    req.body = workingWeekend
                    this.workingWeekend.add.call(this.workingWeekend, req, res)
                    next()
                    return
                }
                res.sendStatus(409)
            }),
        this.app.get(
            '/holiday/list',
            this.holiday.list.bind(this.holiday),
        )
        this.app.delete(
            '/holiday/delete/:id',
            async (
                req: exp.Request,
                res: exp.Response,
                next: exp.NextFunction,
            ) => {
                const deleted = await this.holiday.delete.call(
                    this.holiday,
                    req,
                    res,
                )
                if (deleted) {
                    next()
                    return
                }
                res.sendStatus(404)
            }
        )
        this.app.post(
            '/working-weekend/add',
            async (
                req: exp.Request,
                res: exp.Response,
                next: exp.NextFunction,
            ) => {
                const added = await this.workingWeekend.add.call(
                    this.workingWeekend,
                    req,
                    res,
                )
                if (added) {
                    next()
                    return
                }
                res.sendStatus(409)
            })
        this.app.get(
            '/working-weekend/list',
            this.workingWeekend.list.bind(this.workingWeekend),
        )
        this.app.delete(
            '/working-weekend/delete/:id',
            async (
                req: exp.Request,
                res: exp.Response,
                next: exp.NextFunction,
            ) => {
                const deleted = await this.workingWeekend.delete.call(
                    this.workingWeekend, req, res
                )
                if (deleted) {
                    next()
                    return
                }
                res.sendStatus(404)
            },
        )
        this.app.get('/day/check/:date', this.checkDay.bind(this))
        this.app.get('/working-hour/get', this.getWorkingHours.bind(this))
        this.app.delete('/clean', this.clean.bind(this))
        this.app.use(this.updateWorkingHours.bind(this))
        this.app.listen(8000)
    }
}


export { Calendar }
