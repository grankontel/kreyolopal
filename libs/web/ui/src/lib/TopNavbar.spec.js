import { render } from '@testing-library/react';
import TopNavbar from './TopNavbar';
describe('TopNavbar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TopNavbar />);
    expect(baseElement).toBeTruthy();
  });
});
