type Weekend = {
    id?: number
    date: Date 
}

type Holiday = Weekend & {
    name: string
}

type Day = Weekend | Holiday

type Days = Weekend[] | Holiday[]

type WorkingHours = number

type Monthed<A extends Weekend[] | Holiday[] | WorkingHours> = {
    [month: number]: A
}

type Month = 'january'
           | 'february'
           | 'march'
           | 'april'
           | 'may'
           | 'june'
           | 'july'
           | 'august'
           | 'september'
           | 'october'
           | 'november'
           | 'december'

type ShortMonth = 'jan'
                | 'feb'
                | 'mar'
                | 'apr'
                | 'may'
                | 'jun'
                | 'jul'
                | 'aug'
                | 'sep'
                | 'oct'
                | 'nov'
                | 'dec'

type MonthNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

type MonthWorkingHours = {
    month: MonthNumber
    workingHours: WorkingHours 
}

type MonthInterval = {
    from: MonthNumber
    to: MonthNumber
}


const WEEK_DAYS = 7
const WEEKEND_DAYS = 2
const WEEKDAY_WORKING_HOURS = 8
const WEEKEND_WORKING_HOURS = 7


const monthToNumber = (month: Month | ShortMonth): MonthNumber => {
    switch(month) {
        case('january'): return 0
        case('jan'): return 0
        case('february'): return 1
        case('feb'): return 1
        case('march'): return 2
        case('mar'): return 2
        case('april'): return 3
        case('apr'): return 3
        case('may'): return 4
        case('june'): return 5
        case('jun'): return 5
        case('july'): return 6
        case('jul'): return 6
        case('august'): return 7
        case('aug'): return 7
        case('september'): return 8
        case('sep'): return 8
        case('october'): return 9
        case('oct'): return 9
        case('november'): return 10
        case('nov'): return 10
        case('december'): return 11
        case('dec'): return 11
    }
}

const numberToMonth = (n: MonthNumber): Month | ShortMonth => {
    switch(n) {
        case 0: return 'january'
        case 0: return 'jan'
        case 1: return 'february'
        case 1: return 'feb'
        case 2: return 'march'
        case 2: return 'mar'
        case 3: return 'april'
        case 3: return 'apr'
        case 4: return 'may'
        case 5: return 'june'
        case 5: return 'jun'
        case 6: return 'july'
        case 6: return 'jul'
        case 7: return 'august'
        case 7: return 'aug'
        case 8: return 'september'
        case 8: return 'sep'
        case 9: return 'october'
        case 9: return 'oct'
        case 10: return 'november'
        case 10: return 'nov'
        case 11: return 'december'
        case 11: return 'dec'
        default: throw new Error('No corresponding month')
    }
}

const addDays = (date: Date, days: number) => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + days)
    return newDate
}

const shiftWeekend = ({ date }: Holiday): Weekend => {
    const day = new Date(date).getDay()
    const daysToNextWeekend = WEEK_DAYS - day
    const workingWeekendDate = addDays(date, day + daysToNextWeekend)
    const workingWeekend = { date: workingWeekendDate }
    return workingWeekend
}

const monthDays = (days: Days): Monthed<Days> => {
    const emptyMonthedDays: Monthed<Days> = {}
    return days.reduce(
        (monthedDays, h) => {
            const month = new Date(h.date).getMonth()
            return {
                ...monthedDays,
                [month]:
                    monthedDays.hasOwnProperty(month)
                        ? [ ...monthedDays[month], h ]
                        : [ h ]
            }
        },
        emptyMonthedDays,
    )
}

const countMonthLength = (date: Date): number => {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return d.getDate()
}

const consecutiveDays = (x: Date, y: Date) => x.getDay() + 1 === y.getDay()

const groupBy = <A>(f: (x: A, y: A) => boolean) => (xs: A[]) => xs.reduce(
    (grouped: A[][], x: A, i: number) => {
        const y = xs[i + 1]
        const similar = y ? f(x, y) : true
        const lastGroup = grouped.length - 1
        return similar
            ? [
                ...grouped.slice(0, lastGroup),
                [
                    ...grouped[lastGroup].slice(
                        0,
                        grouped[lastGroup].length - 1,
                    ),
                    x,
                    ...y ? [ y ] : []
                ]
            ]
            : [ ...grouped, [] ]
    }, [[]])

const monthWorkingHours = (
    holidays: Holiday[]
) => (workingWeekends: Weekend[]): Monthed<WorkingHours> => {
    const monthedHolidays = monthDays(holidays)
    const monthedWorkingWeekends = monthDays(workingWeekends)
    const emptyMonthedWorkingHours: Monthed<WorkingHours> = {}
    return Object.entries(monthedHolidays).reduce(
        (monthedWorkingHours, [ m, hs ]) => {
            const month = +m
            const monthLength = countMonthLength(hs[0].date)
            const weekdays = Math.round(
                monthLength - monthLength / WEEK_DAYS * WEEKEND_DAYS
            )
            const workingWeekdays = weekdays - hs.length
            const workingWeekendsPresent = !!monthedWorkingWeekends[month]
            const workingWeekendsHours = workingWeekendsPresent
                                       ? monthedWorkingWeekends[month].length
                                       * WEEKDAY_WORKING_HOURS
                                       : 0
            const holidaySequenceDates = groupBy(consecutiveDays)(holidays.map(
                ({ date }) => date)
            )
            const workingHours = workingWeekdays
                               * WEEKDAY_WORKING_HOURS
                               + workingWeekendsHours
                               - holidaySequenceDates.length
                               * (WEEKDAY_WORKING_HOURS - WEEKEND_WORKING_HOURS)
            return { ...monthedWorkingHours, [month]: workingHours }
        },
        emptyMonthedWorkingHours,
    )
}

const parseMonthBoundary = (b: string): MonthNumber =>
    b && parseInt(b)
        ? parseInt(b) - 1 as MonthNumber
        : monthToNumber(b.toLowerCase() as Month || b as ShortMonth)

const parseMonthInterval = (
    m: undefined | string
) => (
    from: undefined | string
) => (
    to: undefined | string
): MonthInterval => {
    const month = m && parseInt(m)
                ? numberToMonth(parseInt(m) - 1 as MonthNumber)
                : m
    return {
        from: parseMonthBoundary(from || month || 'january'),
        to: parseMonthBoundary(to || month || 'december'),
    }
}

const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 6 || day === 0
}


export { numberToMonth, shiftWeekend, monthWorkingHours, parseMonthInterval, isWeekend }
export type {
    Weekend,
    Holiday,
    Day,
    Days,
    MonthNumber,
    MonthInterval,
    MonthWorkingHours,
}
