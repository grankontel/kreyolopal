import { render } from '@testing-library/react';
import FindByType from './FindByType';
describe('FindByType', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FindByType />);
    expect(baseElement).toBeTruthy();
  });
});
