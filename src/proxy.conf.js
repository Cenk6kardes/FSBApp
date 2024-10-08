
const WFTARGET = "http://localhost:7029"
const ENGAGEMENT_TARGET = "http://localhost:3000";

const PROXY_CONFIG = [
    {
        context: [
            "/api",
            "/forecast",
            "/etc",// multiple
        ],
        target: WFTARGET,
        secure: false,
        logLevel: "debug"
    },
    {
        context: [
            "/engagement",
        ],
        target: ENGAGEMENT_TARGET,
        secure: false,
        logLevel: "debug"
    }
]

module.exports = PROXY_CONFIG;