import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchLocations } from '../redux/slices/locationsSlice';

// The location list for any screen: loaded once on first use and shared through the store,
// so it never depends on which page the user happened to open first.
export const useLocations = () => {
    const dispatch = useAppDispatch();
    const { locations, status, error } = useAppSelector((state) => state.locations);

    useEffect(() => {
        if (status === 'idle') void dispatch(fetchLocations());
    }, [dispatch, status]);

    return { locations, status, error, reload: () => dispatch(fetchLocations()) };
};
