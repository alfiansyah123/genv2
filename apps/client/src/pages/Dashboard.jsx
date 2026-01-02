import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import Toolbar from '../components/Toolbar';
import TrackerTable from '../components/TrackerTable';
import CreateTrackerModal from '../components/CreateTrackerModal';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';

export default function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isDark } = useTheme();
    const [trackers, setTrackers] = useState([]);
    const [editingTracker, setEditingTracker] = useState(null);

    useEffect(() => {
        fetchTrackers();
    }, []);

    const fetchTrackers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/trackers`);
            if (response.ok) {
                const data = await response.json();
                setTrackers(data);
            }
        } catch (error) {
            console.error('Failed to fetch trackers:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/trackers/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchTrackers(); // Refresh list
            } else {
                alert('Failed to delete tracker');
            }
        } catch (error) {
            console.error('Error deleting tracker:', error);
        }
    };

    const handleEdit = (tracker) => {
        setEditingTracker(tracker);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTracker(null); // Clear editing state
        fetchTrackers(); // Refresh list after modal close (in case of update)
    };

    return (
        <>
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className={`text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Tracker
                    </h1>
                    <p className={`text-base font-normal ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <StatsCard count={trackers.length} />
                </div>
            </div>

            {/* Toolbar Section */}
            <Toolbar onOpenCreateModal={() => setIsModalOpen(true)} />

            {/* Data Table */}
            <TrackerTable trackers={trackers} onDelete={handleDelete} onEdit={handleEdit} />

            <CreateTrackerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                trackerToEdit={editingTracker}
            />
        </>
    );
}
