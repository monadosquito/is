import { Weekend } from '@core/Day'
import { IDayRepository } from '@ports/DayRepository'

import { Pool } from 'pg'


class WorkingWeekendPostgresql implements IDayRepository<Weekend> {
    private connection: Pool

    constructor(connection: Pool) {
        this.connection = connection 
    }

    async add({ date }: Weekend): Promise<boolean> {
        const foundQry = await this.connection.query(
            'SELECT EXISTS (SELECT * FROM working_weekend WHERE date = $1)',
            [ date ],
        )
        const isHolidayQry = await this.connection.query(
            'SELECT EXISTS (SELECT * FROM holiday WHERE date = $1)',
            [ date ],
        )
        const found = foundQry.rows[0].exists
        const isHoliday = isHolidayQry.rows[0].exists
        if (!found && !isHoliday) {
            await this.connection.query(
                'INSERT INTO working_weekend(date) VALUES ($1)',
                [ date ],
            )
        }
        return !found && !isHoliday
    }

    async list(): Promise<Weekend[]> {
        const qry = await this.connection.query('SELECT * FROM working_weekend')
        return qry.rows
    }

    async delete(id: number): Promise<boolean> {
        const qry = await this.connection.query(
            'DELETE FROM working_weekend WHERE id = $1 RETURNING *',
            [ id ],
        )
        const deleted = qry.rows.length !== 0 
        return deleted
    }
}


export { WorkingWeekendPostgresql }
