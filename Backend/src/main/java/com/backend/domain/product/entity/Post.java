import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter


public class Comp {
    private int product_id;
    private int product_price;
    private int quantity;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String image_url;
    private String product_name;



}
