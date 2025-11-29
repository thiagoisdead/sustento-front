export const getTodaysDate = () => new Date().toISOString().split("T")[0];

export const isValid24HourTime = (timeString: string) => {
    const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
};

export const formatDisplayDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return `Eventos para ${date.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })}`;
};