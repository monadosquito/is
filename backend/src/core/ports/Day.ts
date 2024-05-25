interface IDay<Req, Res> {
    add(req: Req, res: Res): Promise<boolean>
    list(req: Req, res: Res): void
    delete(req: Req, res: Res): Promise<boolean>
}


export type { IDay }
