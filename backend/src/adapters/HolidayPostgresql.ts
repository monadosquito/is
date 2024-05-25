import { Holiday } from '@core/Day'
import { IDayRepository } from '@ports/DayRepository'

import { Pool } from 'pg'


class HolidayPostgresql implements IDayRepository<Holiday> {
    private connection: Pool

    constructor(connection: Pool) {
        this.connection = connection 
    }

    async add({ name, date }: Holiday): Promise<boolean> {
        const qry = await this.connection.query(
            'SELECT EXISTS \
            (SELECT * \
            FROM holiday \
            WHERE name = $1 AND date = $2 \
            )',
            [ name, date ],
        )
        const found = qry.rows[0].exists
        if (!found) {
            this.connection.query(
                'INSERT INTO holiday(name, date) VALUES ($1, $2)',
                [ name, date ],
            )
        }
        const added = !found
        return added
    }

    async list(): Promise<Holiday[]> {
        const qry = await this.connection.query('SELECT * FROM holiday')
        return qry.rows
    }

    async delete(id: number): Promise<boolean> {
        const qry = await this.connection.query(
            'DELETE FROM holiday WHERE id = $1 RETURNING *',
            [ id ],
        )
        const deleted = qry.rows.length !== 0 
        return deleted
    }
}


export { HolidayPostgresql }
