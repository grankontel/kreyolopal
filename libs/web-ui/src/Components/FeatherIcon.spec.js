import { render } from '@testing-library/react';
import FeatherIcon from './FeatherIcon';
describe('FeatherIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeatherIcon />);
    expect(baseElement).toBeTruthy();
  });
});
