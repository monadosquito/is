interface ICalendar<Req, Res> {
    updateWorkingHours: (req: Req, res: Res) => Promise<void>
    checkDay: (req: Req, res: Res) => Promise<void>
    getWorkingHours: (req: Req, res: Res) => Promise<void>
    clean: (req: Req, res: Res) => Promise<void>
    run: () => void
}


export type { ICalendar }
