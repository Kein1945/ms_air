// ===============================================================================
// Обязанность каждого пакета это чтение и интепретация данных и не более того
// ===============================================================================

cl.helpers.package = {
    service: {
        hello: { id: 1, name: 'Hello' }
        , buttonmask: { id: 2, name: 'Button enablement mask' }

        , info: { id: 5, name: 'Info' }
        , warning: { id: 6, name: 'Warning' }
        , error: { id: 7, name: 'Error' }
    }
    , agent: {
        authorize: { id: 101, name: 'Authorize' }
        , setstate: { id: 105, name: 'Set state' }
        , getstate: { id: 106, name: 'Get state' }
    }
    , call: {
        begin: { id: 201, name: 'Call begin' }
        , established: { id: 206, name: 'Call established' }

        , answer: { id: 202, name: 'Call answer' }
        , release: { id: 203, name: 'Call release' }

        , hold: { id: 204, name: 'Call hold' }
        , unhold: { id: 205, name: 'Call unhold' }

        , end: { id: 220, name: 'Call end' }
    }
    , version: 1
}