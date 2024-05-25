import { MonthInterval, MonthWorkingHours } from "@core/Day";
import { ICalendarRepository } from "@ports/CalendarRepository";

import { Pool } from "pg";


class CalendarPostgresql implements ICalendarRepository {
    connection: Pool 

    constructor(connection: Pool) {
        this.connection = connection
    }

    async addMonthWorkingHours({ month, workingHours } : MonthWorkingHours) {
        await this.connection.query(
            'INSERT INTO working_hours (month, working_hours) VALUES ($1, $2)',
            [ month, workingHours ],
        )
    }

    async clean() {
        await this.connection.query('DELETE FROM holiday')
        await this.connection.query('DELETE FROM working_weekend')
        await this.connection.query('DELETE FROM working_hours')
    }

    async getWorkingHours(
        interval: MonthInterval
    ): Promise<MonthWorkingHours[]> {
        const qry = await this.connection.query(
            'SELECT * \
            FROM working_hours \
            WHERE month BETWEEN $1 AND $2',
            [ interval.from, interval.to ],
        )
        return qry.rows
    }

    async isHoliday(date: Date): Promise<boolean> {
        const qry = await this.connection.query(
            'SELECT EXISTS(SELECT * FROM holiday WHERE date = $1)',
            [ date ],
        )
        const isHoliday = qry.rows[0].exists
        return isHoliday
    }

    async isWeekendWorking(date: Date): Promise<boolean> {
        const qry = await this.connection.query(
            'SELECT EXISTS(SELECT * FROM working_weekend WHERE date = $1)',
            [ date ],
        )
        const working = qry.rows[0].exists
        return working
    }

    async cleanMonthWorkingHours() {
        await this.connection.query('DELETE FROM working_hours')
    }

    async list(): Promise<MonthWorkingHours[]> {
        const qry = await this.connection.query('SELECT * FROM working_hours')
        return qry.rows
    }
}


export { CalendarPostgresql }
