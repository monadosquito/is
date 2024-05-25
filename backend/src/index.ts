import { HolidayPostgresql } from '@adapters/HolidayPostgresql'
import { WorkingWeekendPostgresql } from '@adapters/WorkingWeekendPostgresql'
import { CalendarPostgresql } from '@adapters/CalendarPostgresql'
import { Calendar } from './adapters/Calendar'

import { Pool } from 'pg'


const dbConfig = {
    host: 'localhost',
    user: 'calendar',
    password: 'test24password',
    database: 'calendar',
}

const db = new CalendarPostgresql(new Pool(dbConfig))
const holDb = new HolidayPostgresql(new Pool(dbConfig))
const workWeekendDb = new WorkingWeekendPostgresql(new Pool(dbConfig))
const cal = new Calendar(db, holDb, workWeekendDb)
cal.run()
