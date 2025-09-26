import { useNavigation as useNavigationContext } from '../context/NavigationContext';

/**
 * Custom hook to access navigation state and actions
 * 
 * @returns {Object} Navigation context with:
 *   - isCollapsed: boolean - Whether sidebar is collapsed
 *   - toggleCollapse: function - Toggle sidebar collapse state
 *   - setCollapsed: function - Set sidebar collapse state directly
 *   - isMobile: boolean - Whether device is mobile (< 768px)
 * 
 * @example
 * ```jsx
 * import { useNavigation } from '../shared/hooks/useNavigation';
 * 
 * const MyComponent = () => {
 *   const { isCollapsed, toggleCollapse, isMobile } = useNavigation();
 *   
 *   return (
 *     <button onClick={toggleCollapse}>
 *       {isCollapsed ? 'Expand' : 'Collapse'}
 *     </button>
 *   );
 * };
 * ```
 */
export const useNavigation = useNavigationContext;

export default useNavigation;
