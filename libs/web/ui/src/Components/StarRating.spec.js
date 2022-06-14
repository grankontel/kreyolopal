import { render } from '@testing-library/react';
import StarRating from './StarRating';
describe('StarRating', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StarRating />);
    expect(baseElement).toBeTruthy();
  });
});
