import { useEffect } from 'react';
import apiService from '../services/api';

interface PageViewTrackerProps {
  pageName: string;
}

const PageViewTracker: React.FC<PageViewTrackerProps> = ({ pageName }) => {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await apiService.trackPageView(pageName);
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [pageName]);

  return null; // This component doesn't render anything
};

export default PageViewTracker;