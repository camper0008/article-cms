enum DateMonth {
    January,
    February,
    March,
    April,
    May,
    June,
    July,
    August,
    September,
    October,
    November,
    December,
}

function format_day(day: number): string {
    switch (day % 10) {
        case 1:
            return `${day}st`;
        case 2:
            return `${day}nd`;
        case 3:
            return `${day}rd`;
        default:
            return `${day}th`;
    }
}

function format_month(month: DateMonth): string {
    switch (month) {
        case DateMonth.January:
            return "january";
        case DateMonth.February:
            return "february";
        case DateMonth.March:
            return "march";
        case DateMonth.April:
            return "april";
        case DateMonth.May:
            return "may";
        case DateMonth.June:
            return "june";
        case DateMonth.July:
            return "july";
        case DateMonth.August:
            return "august";
        case DateMonth.September:
            return "september";
        case DateMonth.October:
            return "october";
        case DateMonth.November:
            return "november";
        case DateMonth.December:
            return "december";
    }
}

export function format_date(date: Date, include_year = false): string {
    const now = new Date();
    const should_include_year = include_year ||
        now.getFullYear() !== date.getFullYear();
    const result = `${format_day(date.getDate())} ${
        format_month(date.getMonth())
    }`;

    return should_include_year
        ? `${result}, ${date.getFullYear()}`
        : `${result}`;
}
