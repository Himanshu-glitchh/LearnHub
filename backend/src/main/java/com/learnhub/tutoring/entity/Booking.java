package com.learnhub.tutoring.entity;

import com.learnhub.auth.entity.User;
import com.learnhub.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "slot_id", nullable = false)
    private TutorSlot slot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    private String studentNote;
    private Integer tutorRating;
    private String tutorReview;

    public enum BookingStatus { CONFIRMED, CANCELLED, COMPLETED }
}
