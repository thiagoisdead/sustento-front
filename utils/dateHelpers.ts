export const getTodaysDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return date.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

export const isValid24HourTime = (timeString: string) => {
    const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
};