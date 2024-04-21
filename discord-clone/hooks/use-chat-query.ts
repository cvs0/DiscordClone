import { useSocket } from "@/components/providers/socket-provider";
import { useInfiniteQuery, UseInfiniteQueryOptions } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import qs from "query-string";

interface ChatQueryProps {
    queryKey: string;
    apiUrl: string;
    paramKey: "channelId" | "conversationid";
    paramValue: string;
}

export const useChatQuery = ({
    queryKey,
    apiUrl,
    paramKey,
    paramValue,
}: ChatQueryProps) => {
    const { isConnected } = useSocket();
    const params = useParams();

    const fetchMessages = async ({ pageParam = undefined }) => {
        const url = qs.stringifyUrl({
            url: apiUrl,
            query: {
                cursor: pageParam,
                [paramKey]: paramValue
            }
        }, { skipNull: true });

        const res = await fetch(url);

        return res.json();
    };

    const queryOptions: UseInfiniteQueryOptions<any, Error, any, any, any[], any> = {
        queryKey: [queryKey],
        queryFn: fetchMessages,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        initialPageParam: undefined,
    };

    if (isConnected) {
        queryOptions.refetchInterval = false;
    } else {
        queryOptions.refetchInterval = 1000;
    }

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery(queryOptions);

    return {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    };
};
