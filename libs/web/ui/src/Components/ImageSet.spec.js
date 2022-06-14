import { render } from '@testing-library/react';
import ImageSet from './ImageSet';
describe('ImageSet', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ImageSet />);
    expect(baseElement).toBeTruthy();
  });
});
