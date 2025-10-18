type Event = {
    id: number;
    calendarDate: string;
    time: string;
    description: string;
};

type RemoveButtonProps = {
    id: number;
    setEvents: React.Dispatch<
        React.SetStateAction<{
            id: number;
            calendarDate: string;
            time: string;
            description: string;
        }[]>
    >;
};

export type { Event, RemoveButtonProps };