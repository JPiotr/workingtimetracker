
export function convertStringToTime(value : string) : number{
    let data = value.split(':');
    let h = Number(data[0]) * 60 * 60 * 1000;
    let m = Number(data[1]) * 60 * 1000;

    return h + m ;
}

/**
 * 
 * @param value - Time to convert. 
 * @returns time in "00:00:00" format
 */
export function convertTimeToString(value : number) : string {
    let seconds = Math.floor(value / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    return padTo2Digits(hours) + ":" + padTo2Digits(minutes) + ":" + padTo2Digits(seconds);
}

function padTo2Digits(num : number) : string {
    return num.toString().padStart(2, '0');
}